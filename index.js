//require models
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');


// middlewares
app.use(cors());
app.use(express.json());

const url = process.env.MONGO_URI;

mongoose.connect(url)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error(err);
    });


    // mentor schema
const mentorSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true
  },
  assignedStudents: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Student"
    }
  ]
});

//student schema
const studentSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true,
  },
  currentMentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor"
  },
  previousMentor: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentor"
  }]
});


//Create a mentor model
const Mentor = mongoose.model('Mentor', mentorSchema,'mentors');

//Create a student model
const Student = mongoose.model('Student', studentSchema,'students');


// set the endpoints for Mentor-student Task

app.get('/', (request, response) => {
  response.send('<h1> Mentor Student API</h1>');
})

//1.Create a mentor
app.post('/mentor', (request, response) => {

  const { name } = request.body
  const mentor = new Mentor({ name });
  mentor.save()
      .then(mentor => {
          if (mentor) {
              response.status(201).json({ message: `Mentor ${name}  created successfully` });
          }
      })
      .catch(err => {
          response.status(404).json({ err: "Failed to create mentor", "Json-request must include": '{"name":"mentor-name"}' })
      })

})

// api endpoint for getting all mentors details

/*
for checking purpose in postman
https://mentortask.onrender.com/mentor
*/

app.get("/mentor", (req, res) => {
  Mentor.find({}, {}).then((mentor) => {
    res.status(200).json(mentor);
  });
});


//2.Create a student
app.post('/student', (request, response) => {

  const { name } = request.body;
  const student = new Student({ name });
  student.save()
      .then(student => {
          if (student) {
              response.status(201).json({ message: `Student ${name}  created successfully` });
          }
      })
      .catch(err => {
          response.status(404).json({ err: "Failed to create student", "Json input should be": '{"name":"student-name"}' });
      })
})


//  api endpoint for getting all students details

/*
for checking purpose in postman
https://mentortask.onrender.com/student
*/

app.get("/student", (req, res) => {
  Student.find({}, {}).then((student) => {
    res.status(200).json(student);
  });
});



// 03 api endpoint for assigning a student to 
//3a.one mentor-->mutiple student
//3b.not allow to assign a mentor if the student already has a mentor

/*
for checking purpose in postman
assign mentor:https://mentortask.onrender.com/mentor/64cb685cbc165be1fa2649f4/student/64cb6a9ebc165be1fa2649fe
assign mutiple students to a mentor:
https://mentortask.onrender.com/mentor/64cb685cbc165be1fa2649f4/student/64cb6bc8bc165be1fa264a0a
already mentor assigned students to assign a mentor -not allowed
https://mentortask.onrender.com/mentor/64cb69f6bc165be1fa2649f6/student/64cb6bc8bc165be1fa264a0a
*/

app.post("/mentor/:mentorId/student/:studentId", async (req, res) => {
  try {
    const { mentorId, studentId } = req.params;
    const mentor = await Mentor.findById(mentorId);
    const student = await Student.findById(studentId);

    if (!student || !mentor) {
      return res.status(404).json({ message: "ID Not found" });
    }
   
    if(student.currentMentor){
     return res.status(404).json({ message: "Mentor Already assigned for this student"})
    }

    mentor.assignedStudents.push(student);
    student.currentMentor = mentor;
    await mentor.save();
    await student.save();
    res
      .status(200)
      .json({ message: "student assigned to mentor successfully" });
  }
  catch (error) {
    console.log("student assigned to mentor Failed",error);
  }
});

//----------------------------------------------------------------------------------------------
// 04 api endpoint for reassigning a mentor to a student
//  current mentor --> move to previous mentor
//  current mentor -->updated to new mentor
/*
for checking purpose in postman
https://mentortask.onrender.com/mentor/64cb6a22bc165be1fa2649fc/student/64cb6a9ebc165be1fa2649fe*/



app.put("/mentor/:mentorId/student/:studentId", async (req, res) => {
  try {
    const { mentorId, studentId } = req.params;
    const mentor = await Mentor.findById(mentorId);
    const student = await Student.findById(studentId);

    if (!student || !mentor) {
      return res.status(404).json({ message: "ID Not found" });
    }
   
    if(student.currentMentor){
      student.previousMentor.push(student.currentMentor)

    }

    mentor.assignedStudents.push(student);
    student.currentMentor = mentor;
    await mentor.save();
    await student.save();
    res
      .status(200)
      .json({ message: "student Re-assigned to mentor successfully" });
  }
  catch (error) {
    console.log("student Re-assigned to mentor Failed",error);
  }
});




// 05 api endpoint for showing students of a mentor

/*
for checking purpose in postman
https://mentortask.onrender.com/mentor/64cb6a14bc165be1fa2649fa/studentList
*/

app.get("/mentor/:mentorId/studentList", async (req, res) => {
  try {
    const { mentorId } = req.params;
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) return res.status(404).json({ error: "mentor id is not found" });
    let mentorsStudent = {
      Name: `${mentor.name}`,
      StudentList: `${mentor.assignedStudents}`,
    };
    return res.status(200).json(mentorsStudent);
  } catch (error) {
    console.log(error);
  }
});


//06 api endpoint to show previous mentor for a particular student

/*
for checking purpose in postman
https://mentortask.onrender.com/student/64cb6a9ebc165be1fa2649fe/previousMentor
*/

app.get("/student/:studentId/previousMentor", async (req, res) => {
  try {
    const { studentId } = req.params;
    if (studentId.length != 24) {
      return res.status(404).json({ error: "Student id not found" });
    }
    const student = await Student.findById(studentId);
    if (!student.previousMentor) {
      return res
        .status(200)
        .json({ Message: "no previous mentor for this student" });
    }
    let PreviousMentor = {
      "Student Name": `${student.name}`,
      "Previous Mentor": `${student.previousMentor}`,
    };
    res.status(200).json(PreviousMentor);
  } catch (error) {
    console.log(error);
  }
});

 // Listen to the PORT 
  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});