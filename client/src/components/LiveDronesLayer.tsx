import React, { useContext } from "react";
import { MapContext } from "./MapContext";
import { useLiveDrones } from "../hooks/useLiveDrones";

export default function LiveDronesLayer() {
  const map = useContext(MapContext);
  useLiveDrones(map || undefined);
  return null;
}
