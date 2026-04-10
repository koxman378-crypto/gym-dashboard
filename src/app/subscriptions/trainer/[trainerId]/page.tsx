import { redirect } from "next/navigation";

type PageProps = {
  params: { trainerId: string };
};

export default async function TrainerSubscriptionsPage({ params }: PageProps) {
  const { trainerId } = params;
  redirect(`/subscriptions?trainerId=${encodeURIComponent(trainerId)}`);
}
