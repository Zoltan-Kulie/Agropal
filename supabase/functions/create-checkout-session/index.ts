import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    })

    // Get user from auth
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Get request body
    const { job_id } = await req.json()

    if (!job_id) {
      throw new Error('Missing job_id')
    }

    // Fetch job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*, producer_id')
      .eq('id', job_id)
      .single()

    if (jobError || !job) {
      throw new Error('Job not found')
    }

    // Verify user owns the job
    if (job.producer_id !== user.id) {
      throw new Error('Unauthorized: You do not own this job')
    }

    // Verify job status
    if (job.status !== 'draft') {
      throw new Error('Job must be in draft status to publish')
    }

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
    })

    // Get producer profile for metadata
    const { data: producerProfile } = await supabase
      .from('producer_profiles')
      .select('farm_name')
      .eq('user_id', user.id)
      .single()

    const farmName = producerProfile?.farm_name || 'Farm'

    // Create or update job payment record
    const { data: payment, error: paymentError } = await supabase
      .from('job_payments')
      .upsert({
        job_id,
        producer_id: user.id,
        amount_eur: 5.00,
        status: 'created',
      })
      .select()
      .single()

    if (paymentError || !payment) {
      throw new Error('Failed to create payment record')
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Job Publication Fee',
              description: `Publish job: ${job.title} at ${farmName}`,
              metadata: {
                job_id: job.id,
                producer_id: user.id,
              },
            },
            unit_amount: 500, // 5.00 EUR in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/jobs/${job_id}?payment=success`,
      cancel_url: `${req.headers.get('origin')}/jobs/${job_id}?payment=cancelled`,
      metadata: {
        job_id: job.id,
        job_payment_id: payment.id,
        producer_id: user.id,
      },
      customer_email: user.email,
      billing_address_collection: 'required',
    })

    // Update job payment with Stripe session ID
    await supabase
      .from('job_payments')
      .update({
        stripe_session_id: session.id,
      })
      .eq('id', payment.id)

    // Update job status to pending_payment
    await supabase
      .from('jobs')
      .update({ status: 'pending_payment' })
      .eq('id', job_id)

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)

    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
