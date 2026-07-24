import { useEffect, useState } from 'react';
import { config } from '../lib/config';
import { seedEvents } from '../lib/mission-data';
import type { FeedEvent } from '../lib/types';

const arrivals = [
  ['GDK…7H2N', 'cleared the Neon Nori route', '🔥'],
  ['GCP…L81M', 'tipped Suzume for a clean landing', '🪙'],
  ['GBA…4RSP', 'minted a Meteor Miso stamp', '🎟️'],
  ['GDT…9KRL', 'joined the Lunar Lunch Club', '🌙'],
] as const;

export function useMissionStream() {
  const [events, setEvents] = useState<FeedEvent[]>(seedEvents);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (config.eventStreamUrl) {
      const source = new EventSource(config.eventStreamUrl);
      source.onopen = () => setIsLive(true);
      source.onerror = () => setIsLive(false);
      source.onmessage = ({ data }) => {
        try {
          const event = JSON.parse(data) as FeedEvent;
          setEvents((current) => [event, ...current].slice(0, 6));
        } catch { /* malformed remote events are deliberately ignored */ }
      };
      return () => source.close();
    }

    setIsLive(true);
    const timer = window.setInterval(() => {
      const [actor, action, emoji] = arrivals[Math.floor(Math.random() * arrivals.length)];
      setEvents((current) => [{ id: crypto.randomUUID(), actor, action, time: 'just now', emoji }, ...current].slice(0, 6));
    }, 8000);
    return () => window.clearInterval(timer);
  }, []);

  return { events, isLive };
}
