import mongoose from "mongoose";
import fileSchema from "./file.schema.js";


const eventSchema = new mongoose.Schema({

  title : {
    type : String,
    required : true,
    trim : true
  },

  description : {
    type : String,
    required :true,
    trim : true,
    maxlength : 500
  },

  category : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Category",
    required : true,

  },
  vendorId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Vendor",
    required : true
  },
  eventType : {
    type : String,
    enum : ["In-person","Online"],
    required : true
  },
  thumbnail : {
    type : fileSchema,
    required : true
  },
  images : {
    type : [fileSchema],
    defualt : []
  },
  schedule  : {
    date : {
      type : Date,
      required : true
    },
    startTime: {
      type : String,
      required : true
    },
    endTime : {
      type : String,
      required : true
    }
  },
  venue : {
    type : String,
    required : true,
    trim : true
  },
  address : {
    type : String,
    required : true,
    trim : true
  },
  city : {
    type : String,
    required : true,
    trim : true
  },
  state : {
    type : String,
    required : true,
    trim : true
  },
  
  location : {
    latitude  :{
      type : Number
    },
    longitude : {
      type : Number
    }
  },
  ageRestriction : {
    enabled : {
      type : Boolean,
      default : false
    },
    minAge : {
      type : Number,
      default : 18
    }
  },
  ticketType :{
    type : String,
    enum : ["Free","Paid"],
    default : "Paid"
  },
  ticketPrice : {
    type : Number,
    defualt : 0
  },
  totalTickets:{
    type : Number,
    default : 0
  },
  soldTickets : {
    type : Number,
    default : 0
  },
  maxTicketPerPerson : {
    type : Number,
    default : 5,
    min : 1
  },
  offer : {
    enabled : {
      type : Boolean,
      default : false
    },
    discountValue :{
      type : Number,
      default : 0
    },
    minTicketsRequired : {
      type : Number,
      default : 0
    },
    validFrom : {
      type : Date
    },
    validUntil : {
      type : Date
    }
  },
  averageRating :{
    type :  Number,
    default : 0,
    min : 0,
    max: 5
  },
  totalReviews : {
    type : Number,
    default : 0 
  },
  eventStatus : {
    type : String,
    enum : ["pending","cancelled","completed"],
    default : "pending"
  } ,
  isBlocked : {
    type : Boolean,
    default : false
  },
  blockedReason : {
    type : String,
  }

},{timestamps : true})

const Event = mongoose.model("Event",eventSchema)

export default Event 