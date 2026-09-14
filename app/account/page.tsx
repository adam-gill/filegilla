import AccountCard from "@/app/account/components/accountCard";
import ApiKey from "@/app/account/components/apiKey";

export const dynamic = "force-dynamic";

export default function Account() {
  return (
    <>
      <div className="w-full py-10 pt-16">
        <div className="w-full max-w-6xl px-6 mx-auto">
          <AccountCard />
          <ApiKey />
        </div>
      </div>
    </>
  );
}
