import SectionHeader from "@/components/SectionHeader";
import BirthdayBox from "./components/BirthdayBox";
import SectionSubHeader from "@/components/SectionSubHeader";

const Dashboard = () => {
  return (
    <>
      <SectionHeader title="Dashboard" />
      <BirthdayBox
        name="John Doe"
        dob="12 Aug 1998"
        birthdayIn={2}
      />
    </>
  )
};

export default Dashboard;
