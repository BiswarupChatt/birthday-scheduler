// src/modules/.../SIDEBAR_ITEMS.js

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LinkIcon from "@mui/icons-material/Link";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";

import ROUTES from "../../../../../routes/routes";

export const SIDEBAR_ITEMS = [
  {
    name: "Dashboard",
    path: ROUTES.ROOT,
    icon: DashboardIcon,
  },
  {
    name: "Employee",
    path: ROUTES.EMPLOYEE,
    icon: PeopleAltIcon,
  },
  {
    name: "Schedule Messages",
    path: ROUTES.SCHEDULE_MESSAGES,
    icon: ScheduleIcon,
  },
  {
    name: "Connection",
    path: ROUTES.CONNECTION,
    icon: LinkIcon,
  },
];
