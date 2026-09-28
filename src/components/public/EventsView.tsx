import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Download, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { EventItem } from '../../types';

export const EventsView: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEvents()
      .then(res => setEvents(res || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="border-b border-slate-200 pb-6">
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
          Community Calendar
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 font-serif mt-1">
          Meetings, AGM & Community Events
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Statutory General Body Meetings, committee proceedings, and layout cultural festivals.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No scheduled meetings at this moment</p>
        </div>
      ) : (
        <div className="space-y-6">
          {events.map(ev => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs hover:shadow-xs transition"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-bold text-emerald-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{ev.event_date}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ev.event_time}</span>
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{ev.event_name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Venue: <strong className="text-slate-800">{ev.venue}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                    Scheduled
                  </span>
                </div>
              </div>

              <div className="pt-5 space-y-4 text-sm text-slate-700">
                <p className="leading-relaxed">{ev.description}</p>

                {ev.agenda && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2">
                      Meeting Agenda & Key Points:
                    </h4>
                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-mono">
                      {ev.agenda}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
