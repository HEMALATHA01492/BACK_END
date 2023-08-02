//require models
const express = require('express');
const app = express();
const cors=require('cors');

// middlewares
app.use(cors());
app.use(express.json());


// ROOMS DATA
const rooms = [
    {
      roomId: 1,
      no_of_seats: 100,
      amenities: "wifi,AC",
      price_per_hour: 1500,
      roomName: "ROOM 1",
    },
    {
      roomId: 2,
      no_of_seats: 150,
      amenities: "NO-WIFI,NON-AC",
      price_per_hour: 2000,
      roomName: "ROOM 2",
    },
    {
      roomId: 3,
      no_of_seats: 250,
      amenities: "wifi,AC",
      price_per_hour: 3000,
      roomName: "ROOM 3",
    },
    {
        roomId: 4,
        no_of_seats: 200,
        amenities: "wifi,NON-AC",
        price_per_hour: 2000,
        roomName: "ROOM 4",
    },
    {
        roomId: 5,
        no_of_seats: 250,
        amenities: "wifi,NON-AC",
        price_per_hour: 2500,
        roomName: "ROOM 5",
    }
  ];

  //booked rooms data
  const bookRoom = [
    {
      bookingId: 1,
      customerName: "Ganesh",
      roomId: 1,
      date: "07-12-2023",
      start: "08:00",
      end: "09:00",
      status: "BOOKED",
    },
    {
      bookingId: 2,
      customerName: "Nivin",
      roomId: 1,
      date: "07-12-2023",
      start: "08:00",
      end: "09:00",
      status: "PENDING",
    },
    {
      bookingId: 3,
      customerName: "Sree Lakshan",
      roomId: 4,
      date: "07-12-2023",
      start: "08:00",
      end: "09:00",
      status: "BOOKED",
    },
    {
        bookingId: 4,
        customerName: "Sree Lakshan",
        roomId: 4,
        date: "15-12-2023",
        start: "08:00",
        end: "09:00",
        status: "BOOKED",
      },
      {
        bookingId: 5,
        customerName: "Nivin",
        roomId: 5,
        date: "17-12-2023",
        start: "08:00",
        end: "09:00",
        status: "BOOKED",
      },
  ];

// set the endpoints for Hall Booking

app.get('/', (request, response) => {
    response.send('<h1> HALL BOOKING API</h1>');
});

// API to show all ROOMS DETAILS
app.get('/rooms', (request, response) => {
    response.json(rooms);
});

//1. creates a new ROOM 
app.post('/rooms', (request, response) => {
    const{no_of_seats,amenities, price_per_hour,roomName}=request.body;

    const room = {roomId:rooms.length+1,no_of_seats,amenities, price_per_hour,roomName}
    rooms.push(room);
    response.status(201).json({ message: 'Room created successfully' });
});

// fetching a single ROOM Details
app.get('/rooms/:id', (request, response) => {
    const id = Number(request.params.id);
    const room = rooms.find(room => room.roomId === id);
    if (room) {
        response.json(room);
    } else {
        response.status(404).end('Room id does not exist');
    }
});


// API to show  Booking DETAILS
app.get('/book', (request, response) => {
    response.json(bookRoom);
});

//2. BOOK A ROOM 

app.post("/bookRoom", (req, res) => {
    const { customerName, roomId, date, start, end,  status } = req.body;
    const bookingFilter = bookRoom.find(
      (room) => room.date == date && room.roomId == roomId && room.start == start
    );
    if (bookingFilter) {
      return res.status(404).json({ message: "Room already booked" });
    }
    let roomIdVerify = rooms.map((room) => (room = room.roomId));
    if (!roomIdVerify.includes(roomId)) {
      return res
        .status(404)
        .json({ message: "Requested room N/A, Kinldy check Other rooms" });
    }
    const booking = {
      bookingId: bookRoom.length + 1,
      customerName,
      date,
      start,
      end,
      roomId,
      status,
    };
    bookRoom.push(booking);
    res.status(201).json({ message: "Room booked sucessfully" });
  });


  //3.List of Booked Room

  app.get("/bookedRoomData", (req, res) => {
    const bookedRoomData = bookRoom.map((book) => {
      roomsData = rooms.find((room) => room.roomId == book.roomId);
      if (book.status == "BOOKED") {
      return {
        "Room Name": `${roomsData.roomName}`,
        "Booked Status": `${book.status}`,
        "Customer Name": `${book.customerName}`,
        "Date": `${book.date}`,
        "Start Time": `${book.start}`,
        "End Time": `${book.end}`,
      };}else return;
    });
    res.json(bookedRoomData.filter((e)=> e!=null));
  });
      
  //3a.List of NOT Booked Room,Booking Status:not booked or pending
  app.get("/notbookedRoomData", (req, res) => {
    const bookedRoomData = bookRoom.map((book) => {
      roomsData = rooms.find((room) => room.roomId == book.roomId);
      if (book.status != "BOOKED") {
      return {
        "Room Name": `${roomsData.roomName}`,
        "Booked Status": `${book.status}`,
        "Customer Name": `${book.customerName}`,
        "Date": `${book.date}`,
        "Start Time": `${book.start}`,
        "End Time": `${book.end}`,
      };}else return;
    });
    res.json(bookedRoomData.filter((e)=> e!=null));
  });
      

  //4.List all customers with Booked Data

  app.get("/allcustomers", (req, res) => {
    const customerData = bookRoom.map((book) => {
      roomsData = rooms.find((room) => room.roomId == book.roomId);
      return {
        "Customer Name": `${book.customerName}`,
        "Room Name": `${roomsData.roomName}`,
        "Date": `${book.date}`,
        "Start Time": `${book.start}`,
        "End Time": `${book.end}`,
      };
    });
    res.json(customerData);
  });

  
  // 5.List how many times customer booked the rooms with customer name

   app.get('/customer/:name', (req, res) => {
    let CustomerName = req.params.name;
    let BookedCustomers = bookRoom.filter(customer => customer.customerName.toLowerCase() === CustomerName.toLowerCase())
     BookedCustomers=BookedCustomers.map((data)=>{
        let room=rooms.find((e)=>e.roomId == data.roomId);
        return{
            "Customer Name": `${data.customerName}`,
            "Room Name": `${room.roomName}`,
            "Date": `${data.date}`,
            "Start Time": `${data.start}`,
            "End Time": `${data.end}`,
            "Booking id": `${data.bookingId}`,
            "Booking date": `${data.date}`,
            "Booking Status": `${data.status}`
        };
     });
        
       if (BookedCustomers.length) {
        res.status(200).json(BookedCustomers);
        } else {
        res.status(404).json({ message: "Customer name is not available" });
       }
   })



 // Listen to the PORT 
  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});