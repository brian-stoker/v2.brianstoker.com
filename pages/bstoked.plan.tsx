export const getServerSideProps = async () => ({
  redirect: { destination: '/.plan', permanent: true },
});

export default function LegacyPlanIndex() { return null; }
