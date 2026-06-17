import mongoose from "mongoose";
import fileSchema from "./file.schema.js";

const requiredIfNotDraft = function() {
  return this.eventStatus !== "draft";
};


const eventSchema = new mongoose.Schema({

  title : {
    type : String,
    required : true,
    trim : true
  },

  description : {
    type : String,
    required : requiredIfNotDraft,
    trim : true,
    maxlength : 500
  },

  category : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "category",
    required : requiredIfNotDraft,

  },
  vendorId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "Vendor",
    required : true
  },
  eventType : {
    type : String,
    enum : ["In-person","Online"],
    required : requiredIfNotDraft
  },
  thumbnail : {
    type : fileSchema,
    required : requiredIfNotDraft
  },
  images : {
    type : [fileSchema],
    defualt : []
  },
  schedule  : {
    date : {
      type : Date,
      required : requiredIfNotDraft
    },
    startTime: {
      type : String,
      required : requiredIfNotDraft
    },
    endTime : {
      type : String,
      required : requiredIfNotDraft
    }
  },
  venue : {
    type : String,
    required : requiredIfNotDraft,
    trim : true
  },
  address : {
    type : String,
    required : requiredIfNotDraft,
    trim : true
  },
  city : {
    type : String,
    required : requiredIfNotDraft,
    trim : true
  },
  state : {
    type : String,
    required : requiredIfNotDraft,
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
    enum : ["draft","pending","cancelled","completed"],
    default : "pending"
  } ,
  isBlocked : {
    type : Boolean,
    default : false
  },
  blockedReason : {
    type : String,
  },
  isDeleted : {
    type : Boolean,
    default : false
  }

},{timestamps : true})

const Event = mongoose.model("Event",eventSchema)

export default Event 