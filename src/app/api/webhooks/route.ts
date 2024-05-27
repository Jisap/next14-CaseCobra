import { db } from "../../../db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers"
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from 'resend'
import OrderReceivedEmail from "@/components/emails/OrderReceivedEmail";

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {                              // Realizado el pago en stripe el webhook hace una petición a nuestro server para modificar nuestra bd
  
  try {
    const body = await req.text();                                      // Lectura del cuerpo de la solicitud

    const signature = headers().get('stripe-signature')                 // Obtención de la firma de Stripe de los headers

    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response('Invalid signature', { status: 400 })
    }

      const event = stripe.webhooks.constructEvent(                     // Construcción del evento de Stripe a partir del cuerpo y la firma
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    

    if (event.type === 'checkout.session.completed') {                  // Manejo del evento si es del tipo 'checkout.session.completed

      if (!event.data.object.customer_details?.email) {                 // Verificación de la existencia del correo electrónico del cliente
        throw new Error('Missing user email')
      }

      const session = event.data.object as Stripe.Checkout.Session      // Extracción de la sesión de pago de Stripe

      const { userId, orderId } = session.metadata || {                 // Obtención del userId y orderId de los metadatos de la sesión
        userId: null,
        orderId: null,
      }

      if (!userId || !orderId) {
        throw new Error('Invalid request metadata')
      }

      const billingAddress = session.customer_details!.address          // Obtención de las direcciones de facturación y envío del cliente
      const shippingAddress = session.shipping_details!.address

      console.log(`Updating order with ID: ${orderId} for user: ${userId}`);

      const updatedOrder = await db.order.update({                      // Actualización del pedido en la base de datos
        where: {
          id: orderId,
        },
        data: {
          isPaid: true,
          shippingAddress: {
            create: {
              name: session.customer_details!.name!,
              city: shippingAddress!.city!,
              country: shippingAddress!.country!,
              postalCode: shippingAddress!.postal_code!,
              street: shippingAddress!.line1!,
              state: shippingAddress!.state,
            },
          },
          billingAddress: {
            create: {
              name: session.customer_details!.name!,
              city: billingAddress!.city!,
              country: billingAddress!.country!,
              postalCode: billingAddress!.postal_code!,
              street: billingAddress!.line1!,
              state: billingAddress!.state,
            },
          },
        },
      })

      console.log('Order updated successfully', updatedOrder);


      await resend.emails.send({
        from: 'CaseCobra <onboarding@resend.dev>',
        to: [event.data.object.customer_details.email],
        subject: 'Thanks for your order!',
        react: OrderReceivedEmail({
          orderId,
          orderDate: updatedOrder.createdAt.toLocaleDateString(),
          // @ts-ignore
          shippingAddress: {
            name: session.customer_details!.name!,
            city: shippingAddress!.city!,
            country: shippingAddress!.country!,
            postalCode: shippingAddress!.postal_code!,
            street: shippingAddress!.line1!,
            state: shippingAddress!.state,
          },
        }),
      });

      return NextResponse.json({ result: event, ok: true })             // Respuesta exitosa con el resultado del evento:
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { message: 'Something went wrong', ok: false },
      { status: 500 }
    )
  }
}