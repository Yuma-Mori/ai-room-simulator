"use client"
import { Suspense } from "react";
import SimulateRoomArrangement from "./SimulateRoomArrangement";

export default function RoomPage() {
  return (
    <Suspense>
      <SimulateRoomArrangement />
    </Suspense>
  );
}