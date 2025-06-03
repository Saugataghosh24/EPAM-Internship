npx json-server db.json --watch //run json server

The BookingStatus should be converted to lowercase ('reserved' | 'reserved-by-sa' | 'service-started' | 'service-provided' | 'booking-finished' | 'cancelled') before storing in database.