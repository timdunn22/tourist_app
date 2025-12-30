import React from 'react';
import { Link } from 'react-router-dom';

const bookings = [
  { id: 1, title: "Hidden Temple Morning Walk", guide: "Pemba Sherpa", date: "Dec 28, 2024", time: "9:00 AM", guests: 2, total: 50, status: "confirmed", image: "🏛️" },
  { id: 2, title: "Street Food Adventure", guide: "Sita Thapa", date: "Dec 30, 2024", time: "6:00 PM", guests: 3, total: 54, status: "pending", image: "🍜" },
];

const pastBookings = [
  { id: 3, title: "Sunrise Hike to Nagarkot", guide: "Tenzin Lama", date: "Dec 15, 2024", time: "5:00 AM", guests: 2, total: 90, status: "completed", image: "🌄", rating: 5 },
];

function BookingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-8">My Bookings</h1>

      {/* Upcoming */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming</h2>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="card p-6">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-primary-50 flex items-center justify-center text-4xl">
                  {booking.image}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{booking.title}</h3>
                      <p className="text-gray-500">with {booking.guide}</p>
                    </div>
                    <span className={`badge ${booking.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex gap-6 mt-3 text-sm text-gray-600">
                    <span>📅 {booking.date}</span>
                    <span>🕐 {booking.time}</span>
                    <span>👥 {booking.guests} guests</span>
                    <span className="font-semibold text-primary-500">${booking.total}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button className="btn btn-outline text-sm py-2">Message Guide</button>
                <button className="btn btn-ghost text-sm py-2 text-red-500">Cancel</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Past */}
      <section>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Past Bookings</h2>
        <div className="space-y-4">
          {pastBookings.map((booking) => (
            <div key={booking.id} className="card p-6 opacity-75">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-4xl">
                  {booking.image}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{booking.title}</h3>
                  <p className="text-gray-500">with {booking.guide}</p>
                  <div className="flex gap-6 mt-2 text-sm text-gray-600">
                    <span>📅 {booking.date}</span>
                    <span>👥 {booking.guests} guests</span>
                    {booking.rating && <span>⭐ {booking.rating}/5</span>}
                  </div>
                </div>
                <Link to={`/experience/3`} className="btn btn-ghost text-sm">Book Again</Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default BookingsPage;
