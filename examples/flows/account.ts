import maya from "./art/avatar-maya.svg";

/** The fictional signed-in person the example flows share (passed to NavigationBar's `account`). */
export const ME = { name: "Maya Okafor", first: "Maya", initials: "MO", src: maya };
export const account = (onPress?: () => void) => ({ name: ME.name, src: ME.src, initials: ME.initials, onPress });
