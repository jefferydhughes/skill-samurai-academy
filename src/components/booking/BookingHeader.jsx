import React from "react";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";

const BookingHeader = ({
  title = "Book a Free Trial",
  subtitle = "See if Skill Samurai is the right fit for your child",
  locationName = "Moncton",
  address = "Moncton, NB",
  dateRange = "DEC 28, 2025 – JAN 3, 2026",
  onChangeLocation,
  onPrevDate,
  onNextDate,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="bg-[#43A7BE] text-white rounded-xl px-6 py-10 md:py-14 text-center">
        <span className="inline-block mb-4 px-4 py-1 rounded-full bg-white/15 text-sm font-semibold">
          Free Trial Session
        </span>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          {title}
        </h1>

        <p className="mt-3 text-white/90 max-w-xl mx-auto text-base md:text-lg">
          {subtitle}
        </p>

        {/* Location */}
        <div className="mt-6 flex flex-col items-center gap-1">
          <div className="text-lg font-semibold">{locationName}</div>
          <div className="flex items-center text-sm text-white/90">
            <MapPin size={16} className="mr-1.5" />
            <span>{address}</span>
          </div>

          {onChangeLocation && (
            <button
              onClick={onChangeLocation}
              className="mt-2 text-xs font-semibold uppercase tracking-wide underline underline-offset-4 hover:text-white"
            >
              Change location
            </button>
          )}
        </div>
      </div>

      {/* Date Navigation */}
      <div className="bg-white rounded-xl shadow-sm mt-6 px-6 py-5">
        <div className="flex flex-col items-center gap-4">
          <span className="text-sm font-semibold text-[#43A7BE] tracking-wide uppercase">
            Schedule for
          </span>

          <div className="flex items-center gap-6">
            <button
              onClick={onPrevDate}
              className="w-10 h-10 rounded-full bg-[#43A7BE]/10 text-[#43A7BE] flex items-center justify-center hover:bg-[#43A7BE]/20 transition"
            >
              <ChevronLeft />
            </button>

            <span className="text-gray-700 font-semibold text-base md:text-lg text-center min-w-[220px]">
              {dateRange}
            </span>

            <button
              onClick={onNextDate}
              className="w-10 h-10 rounded-full bg-[#43A7BE]/10 text-[#43A7BE] flex items-center justify-center hover:bg-[#43A7BE]/20 transition"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHeader;