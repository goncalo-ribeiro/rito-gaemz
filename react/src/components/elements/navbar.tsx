import React from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import history from "../../utils/history";
import { Link } from "@reach/router";
import League from "../../assets/images/league-of-legends.png";
import League2 from "../../assets/images/league-of-legends2.png";
import TFT from "../../assets/images/tft.webp";
import Spat from "../../assets/images/spat.jpg";
import Home from "../../assets/images/home-page.png";
import Valorant from "../../assets/images/valorant.png";
import Radiant from "../../assets/images/radiant.webp";

import {
  HOME_ROUTE,
  TFT_INSIGHTS_ROUTE,
  TFT_PROFILE_ROUTE,
  RIFT_INSIGHTS_ROUTE,
  RIFT_PROFILE_ROUTE,
  VALORANT_PROFILE_ROUTE,
  VALORANT_INSIGHTS_ROUTE,
} from "../../constants/routes";

export default function NavBar() {
  let value = 0;
  switch (history.location.pathname) {
    case VALORANT_INSIGHTS_ROUTE:
      value = 6;
      break;
    case VALORANT_PROFILE_ROUTE:
      value = 5;
      break;
    case TFT_INSIGHTS_ROUTE:
      value = 4;
      break;
    case TFT_PROFILE_ROUTE:
      value = 3;
      break;
    case RIFT_INSIGHTS_ROUTE:
      value = 2;
      break;
    case RIFT_PROFILE_ROUTE:
      value = 1;
      break;
    default:
  }

  const [page, setPage] = React.useState(value);

  const handleTabChange = (stuff: any, route: number) => {
    setPage(route);
  };

  const TabIcon = (props: any) => {
    return (
      <Link {...props}>
        <img src={props.image} alt={props.label} />
        {props.children}
      </Link>
    );
  };

  return (
    <Tabs
      value={page}
      onChange={handleTabChange}
      indicatorColor="primary"
      textColor="primary"
      centered
    >
      <Tab
        label="Home"
        to={HOME_ROUTE}
        image={Home}
        component={TabIcon}
        className="tab-icon-container"
      />
      <Tab
        label="Rift Profile"
        to={RIFT_PROFILE_ROUTE}
        image={League2}
        component={TabIcon}
        className="tab-icon-container"
      />
      <Tab
        label="Rift Insights"
        to={RIFT_INSIGHTS_ROUTE}
        image={League}
        component={TabIcon}
        className="tab-icon-container"
      />
      <Tab
        label="TFT Profile"
        to={TFT_PROFILE_ROUTE}
        image={TFT}
        component={TabIcon}
        className="tab-icon-container"
      />
      <Tab
        label="TFT Insights"
        to={TFT_INSIGHTS_ROUTE}
        image={Spat}
        component={TabIcon}
        className="tab-icon-container rounded-tab-icon"
      />
      <Tab
        label="Valorant Profile"
        to={VALORANT_PROFILE_ROUTE}
        image={Valorant}
        component={TabIcon}
        className="tab-icon-container"
      />
      <Tab
        label="Valorant Insights"
        to={VALORANT_INSIGHTS_ROUTE}
        image={Radiant}
        component={TabIcon}
        className="tab-icon-container rounded-tab-icon"
      />
    </Tabs>
  );
}
