import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CreditCard, FileText, Shield } from "lucide-react";
import { motion } from "motion/react";

const sections = [
  {
    id: "booking",
    icon: FileText,
    title: "1. Booking Policy",
    content: [
      {
        heading: "1.1 Booking Process",
        text: "All bookings on ShaadiKhaana are subject to availability. A booking is considered confirmed only after successful payment is processed through our Razorpay-powered payment gateway.",
      },
      {
        heading: "1.2 Booking Confirmation",
        text: "Upon successful payment, you will receive a booking confirmation with the details of your reservation. The venue owner will be notified and the dates will be blocked in the calendar.",
      },
      {
        heading: "1.3 Pricing",
        text: "All prices displayed are in Indian Rupees (INR) and include applicable taxes unless otherwise stated. Prices are per day unless specifically mentioned as per hour or per event.",
      },
      {
        heading: "1.4 Booking Charge (2.5%)",
        text: "ShaadiKhaana charges a 2.5% booking charge on the total hall price for each booking. This fee is paid online at the time of booking and covers platform maintenance, payment processing, and customer support. The remaining 97.5% of the hall price is paid directly to the hall owner. The 2.5% booking charge is non-refundable and is separate from the hall price quoted by the owner.",
      },
      {
        heading: "1.5 Direct Payment to Hall Owner",
        text: "The remaining 97.5% of the hall price is settled directly between the customer and the hall owner, outside of the ShaadiKhaana platform. ShaadiKhaana is not responsible for any disputes arising from direct payments between customers and hall owners.",
      },
      {
        heading: "1.6 Accuracy of Information",
        text: "While we strive to ensure all venue information is accurate, ShaadiKhaana cannot guarantee the accuracy of all listing details provided by hall owners. We recommend verifying critical details directly with the venue before booking.",
      },
    ],
  },
  {
    id: "cancellation",
    icon: AlertTriangle,
    title: "2. Cancellation & Refund Policy",
    content: [
      {
        heading: "2.1 Customer Cancellations",
        text: "Customers may cancel a confirmed booking subject to the following refund schedule:",
      },
      {
        heading: "Refund Schedule",
        text: "",
        isTable: true,
      },
      {
        heading: "2.2 Non-Refundable Booking Charge",
        text: "The 2.5% booking charge paid to ShaadiKhaana is non-refundable under any circumstances, including cancellations, venue issues, or force majeure events.",
      },
      {
        heading: "2.3 Venue Cancellations",
        text: "If a venue cancels a confirmed booking, the customer will receive a full refund of the hall price paid directly to the hall owner. ShaadiKhaana will make every effort to find an alternative venue for the customer.",
      },
      {
        heading: "2.4 Refund Processing",
        text: "Refunds for the hall price portion will be processed according to the hall owner's decision and the mode of payment decided by them. The timeline and method of refund are determined by the hall owner directly. The 2.5% ShaadiKhaana booking charge is non-refundable regardless of the outcome.",
      },
      {
        heading: "2.5 Dispute Resolution",
        text: "In case of disputes regarding cancellations or refunds, customers may contact ShaadiKhaana support. All disputes will be reviewed on a case-by-case basis, and our decision will be final.",
      },
    ],
  },
  {
    id: "payment",
    icon: CreditCard,
    title: "3. Payment Policy",
    content: [
      {
        heading: "3.1 Payment Methods",
        text: "ShaadiKhaana accepts all major credit cards, debit cards, UPI, NetBanking, and wallet payments through Razorpay. All transactions are encrypted and secure.",
      },
      {
        heading: "3.2 Payment Security",
        text: "All payments are processed by Razorpay, a trusted Indian payment processor. ShaadiKhaana does not store any credit card or sensitive payment information on our servers.",
      },
      {
        heading: "3.3 Currency",
        text: "All transactions are processed in Indian Rupees (INR). International card holders may be subject to foreign transaction fees by their bank, which are not covered by ShaadiKhaana.",
      },
      {
        heading: "3.4 Failed Payments",
        text: "If a payment fails, your booking will not be confirmed. Please ensure you have sufficient funds and your payment method is valid. Contact your bank if the issue persists.",
      },
      {
        heading: "3.5 Receipts",
        text: "Digital receipts will be sent to the email address provided during booking. Receipts are also available in your ShaadiKhaana dashboard under 'My Bookings'.",
      },
    ],
  },
  {
    id: "conduct",
    icon: Shield,
    title: "4. User Conduct & Responsibilities",
    content: [
      {
        heading: "4.1 Venue Care",
        text: "Customers are responsible for the care and proper use of the booked venue. Any damage caused during the event may result in additional charges as determined by the venue owner.",
      },
      {
        heading: "4.2 Compliance",
        text: "All events must comply with local laws and regulations including noise ordinances, fire safety codes, and capacity limits. Customers are responsible for obtaining any required permits.",
      },
      {
        heading: "4.3 Hall Owners",
        text: "Hall owners listing their venues on ShaadiKhaana are responsible for the accuracy of their listings, maintaining their properties to the standard described, and honoring confirmed bookings.",
      },
      {
        heading: "4.4 Account Responsibility",
        text: "You are responsible for maintaining the security of your account. Any bookings or activities made through your account are your responsibility.",
      },
    ],
  },
];

const refundTable = [
  {
    timing: "7 or more days before event",
    refund: "80% of hall price",
    serviceFee: "Non-refundable",
  },
  {
    timing: "3 to 6 days before event",
    refund: "50% of hall price",
    serviceFee: "Non-refundable",
  },
  {
    timing: "Less than 3 days before event",
    refund: "No refund",
    serviceFee: "Non-refundable",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-foreground" />
            </div>
            <p className="text-primary-foreground/60 text-sm font-medium uppercase tracking-wider">
              Legal
            </p>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
            Terms & Conditions
          </h1>
          <p className="text-primary-foreground/70 text-sm max-w-xl">
            Please read these terms carefully before using ShaadiKhaana. By
            using our platform, you agree to be bound by these terms.
          </p>
          <p className="text-primary-foreground/50 text-xs mt-3">
            Last updated: March 2026
          </p>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="bg-card border-b border-border sticky top-16 z-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-1 py-2 overflow-x-auto no-scrollbar">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap px-3 py-1.5 rounded-full hover:bg-muted"
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.title.split(". ")[1]}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 max-w-4xl py-12">
        <div className="space-y-12">
          {sections.map((section, sIdx) => (
            <motion.section
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="scroll-mt-32"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-5">
                {section.content.map((item) => (
                  <div key={item.heading}>
                    {item.isTable ? (
                      <div>
                        <h3 className="font-semibold text-sm text-foreground mb-3">
                          {item.heading}
                        </h3>
                        <div className="overflow-x-auto rounded-xl border border-border">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-muted/50 border-b border-border">
                                <th className="text-left text-xs font-semibold text-foreground p-3">
                                  Cancellation Timing
                                </th>
                                <th className="text-left text-xs font-semibold text-foreground p-3">
                                  Hall Price Refund
                                </th>
                                <th className="text-left text-xs font-semibold text-foreground p-3">
                                  Booking Charge (2.5%)
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {refundTable.map((row, ri) => (
                                <tr
                                  key={row.timing}
                                  className={`border-b border-border last:border-0 ${ri === 0 ? "bg-green-50/50" : ri === 1 ? "bg-yellow-50/50" : "bg-red-50/50"}`}
                                >
                                  <td className="text-sm font-medium text-foreground p-3">
                                    {row.timing}
                                  </td>
                                  <td
                                    className={`text-sm font-semibold p-3 ${
                                      ri === 0
                                        ? "text-green-700"
                                        : ri === 1
                                          ? "text-amber-700"
                                          : "text-red-700"
                                    }`}
                                  >
                                    {row.refund}
                                  </td>
                                  <td className="text-sm text-red-600 font-medium p-3">
                                    {row.serviceFee}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold text-sm text-foreground mb-1.5">
                          {item.heading}
                        </h3>
                        {item.text && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.text}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {sIdx < sections.length - 1 && <Separator className="mt-12" />}
            </motion.section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-12 bg-muted/30 rounded-xl p-6 border border-border text-center">
          <p className="text-sm text-muted-foreground">
            By using ShaadiKhaana, you acknowledge that you have read,
            understood, and agree to these Terms & Conditions. For any queries,
            please contact our support team.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            These terms are subject to change. We will notify users of any
            significant changes via email or platform notification.
          </p>
        </div>
      </div>
    </div>
  );
}
