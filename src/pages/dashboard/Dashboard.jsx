import SectionHeader from "@/components/SectionHeader";
import BirthdayList from "./components/BirthdayList";
import SectionSubHeader from "@/components/SectionSubHeader";
import BirthdayTemplateEditor from "./components/BirthdayTemplateEditor2";

const Dashboard = () => {
  return (
    <>
      <SectionHeader title="Dashboard" />
      <BirthdayList />
      <BirthdayTemplateEditor />
    </>
  )
};

export default Dashboard;
