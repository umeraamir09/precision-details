"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";


export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar(props: CalendarProps) {
  return <DayPicker classNames={{
    selected: `border border-primary text-primary`,
    today: ` text-primary`,
    chevron: `fill-primary`
  }} {...props} />;
}

export default Calendar;
