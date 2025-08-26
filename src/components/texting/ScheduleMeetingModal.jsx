import React from "react";
import { Dialog } from "@headlessui/react";
import { FiClock } from "react-icons/fi";

export default function ScheduleMeetingModal({ open, onClose, onSchedule }) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="max-w-md w-full p-6 rounded-2xl shadow-xl bg-white">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Book a Meeting
            </h2>
          </div>

          <div className="mt-4 space-y-4">
            <button
              onClick={() => onSchedule(30)}
              className="w-full flex items-center justify-between px-4 py-3 border rounded-lg hover:bg-gray-100"
            >
              <span className="flex items-center gap-2 text-gray-700">
                <FiClock className="text-gray-500" />
                30-minute Meeting
              </span>
              <span className="text-sm text-gray-500">Choose</span>
            </button>

            <button
              onClick={() => onSchedule(60)}
              className="w-full flex items-center justify-between px-4 py-3 border rounded-lg hover:bg-gray-100"
            >
              <span className="flex items-center gap-2 text-gray-700">
                <FiClock className="text-gray-500" />
                60-minute Meeting
              </span>
              <span className="text-sm text-gray-500">Choose</span>
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}