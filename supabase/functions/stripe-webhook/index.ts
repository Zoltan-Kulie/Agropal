import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { verifySignature } from 'https://esm.sh/@stripe/stripe-js@14.21.0'

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const stripe = new Stripe(stripeSecretKey!, {
  apiVersion: '2024-11-20.acacia',
})

const supabase = createClient(supabaseUrl, supabaseServiceKey)

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
    const signature = req.headers.get('stripe-signature')

    if (!signature || !webhookSecret) {
      throw new Error('Missing signature or webhook secret')
    }

    // Get raw body
    const body = await req.text()

    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )

    console.log(`Received Stripe event: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionExpired(session)
        break
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentSucceeded(paymentIntent)
        break
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentFailed(paymentIntent)
        break
      }
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)

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

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { job_id, job_payment_id, producer_id } = session.metadata as {
    job_id: string
    job_payment_id: string
    producer_id: string
  }

  console.log(`Processing checkout.session.completed for job: ${job_id}`)

  // Update payment record
  const { error: paymentError } = await supabase
    .from('job_payments')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .eq('id', job_payment_id)

  if (paymentError) {
    console.error('Error updating payment:', paymentError)
    throw paymentError
  }

  // Publish job via database function
  const { error: jobError } = await supabase.rpc('publish_job', {
    p_job_id: job_id,
  })

  if (jobError) {
    console.error('Error publishing job:', jobError)
    throw jobError
  }

  console.log(`Job ${job_id} published successfully`)
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session) {
  const { job_id, job_payment_id } = session.metadata as {
    job_id: string
    job_payment_id: string
  }

  console.log(`Processing checkout.session.expired for job: ${job_id}`)

  // Update payment record
  await supabase
    .from('job_payments')
    .update({
      status: 'failed',
    })
    .eq('id', job_payment_id)

  // Revert job status to draft
  await supabase
    .from('jobs')
    .update({
      status: 'draft',
    })
    .eq('id', job_id)
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Processing payment_intent.succeeded: ${paymentIntent.id}`)

  // Additional handling if needed
  // The main logic is handled in checkout.session.completed
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Processing payment_intent.payment_failed: ${paymentIntent.id}`)

  // Find job payment by payment intent ID and update status
  const { data: payments } = await supabase
    .from('job_payments')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntent.id)

  if (payments && payments.length > 0) {
    const payment = payments[0]

    await supabase
      .from('job_payments')
      .update({
        status: 'failed',
      })
      .eq('id', payment.id)

    // Revert job status to draft
    await supabase
      .from('jobs')
      .update({
        status: 'draft',
      })
      .eq('id', payment.job_id)
  }
}
