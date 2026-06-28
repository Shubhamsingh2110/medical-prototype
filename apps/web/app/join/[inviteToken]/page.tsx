import { PatientJoinScreen } from "../../../components/patient-join-screen";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ inviteToken: string }>;
}) {
  const { inviteToken } = await params;
  return <PatientJoinScreen inviteToken={inviteToken} />;
}
