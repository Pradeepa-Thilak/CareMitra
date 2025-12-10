// src/components/ConsultationHero.jsx
import React from "react";
import { Clock, MessageSquare, FileText } from "lucide-react";

/**
 * ConsultationHero (updated copy)
 * - same layout as before, new wording and microcopy
 * - props: startingPrice, onStart, stats
 */
export default function ConsultationHero({
  startingPrice = 199,
  onStart = () => {},
  stats = { consultations: "30 L+", doctors: "3k+", cities: "22+" },
}) {
  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left column: headline, features, CTA */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
              Quick access to trusted doctors — anytime, anywhere
            </h1>

            <p className="text-gray-600 mt-3">
              Consult a verified doctor online. Prices from <span className="font-semibold">₹{startingPrice}</span>
            </p>

            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <li className="flex gap-3 items-start">
                <div className="p-2 rounded-full bg-white shadow-sm">
                  <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Connect within 30 minutes</div>
                  <div className="text-xs text-gray-500">Fast responses from on-duty doctors</div>
                </div>
              </li>

              <li className="flex gap-3 items-start">
                <div className="p-2 rounded-full bg-white shadow-sm">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Follow-up included</div>
                  <div className="text-xs text-gray-500">Free follow-ups for 3 days after consultation</div>
                </div>
              </li>

              <li className="flex gap-3 items-start">
                <div className="p-2 rounded-full bg-white shadow-sm">
                  <FileText className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="text-sm font-medium">Digital prescription</div>
                  <div className="text-xs text-gray-500">Receive a secure, doctor-signed prescription</div>
                </div>
              </li>
            </ul>

            <div className="mt-6">
              <button
                onClick={onStart}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-md shadow"
              >
                Start a Consultation
              </button>
            </div>
          </div>

          {/* Right column: illustration */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm">
              {/* Swap this image for your illustration if you have one */}
              <img
                src="https://images.unsplash.com/photo-1588774067562-1b8b8f2f1c6d?auto=format&fit=crop&w=600&q=60"
                alt="online consultation"
                className="w-full rounded"
              />
            </div>
          </div>
        </div>

        {/* Stats area with fresh labels */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded shadow text-center">
            <div className="text-3xl font-extrabold text-indigo-600">{stats.consultations}</div>
            <div className="text-sm text-gray-500 mt-1">Total consultations delivered</div>
          </div>

          <div className="bg-white p-6 rounded shadow text-center">
            <div className="text-3xl font-extrabold text-indigo-600">{stats.doctors}</div>
            <div className="text-sm text-gray-500 mt-1">Active certified doctors</div>
          </div>

          <div className="bg-white p-6 rounded shadow text-center">
            <div className="text-3xl font-extrabold text-indigo-600">{stats.cities}</div>
            <div className="text-sm text-gray-500 mt-1">Cities covered</div>
          </div>
        </div>
      </div>
    </section>
  );
}
