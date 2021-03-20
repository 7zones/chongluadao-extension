import React from "react";

import { ReactComponent as Avatar } from "../../static/svg/avatar-demo.svg";
import { ReactComponent as star } from "../../static/svg/star.svg";

const icons = {
  avatar: Avatar,
  star: star,
};

export default function Icon({ type, ...rest }) {
  const Component = icons[type];

  if (!Component) {
    console.error(
      `The icon with type:${type} doesn't exist. Make sure you pass the existing one.`
    );
    return null;
  }
  return <Component fill="currentColor" {...rest} />;
}
