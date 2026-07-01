import mongoose from "mongoose";
import fileSchema from "./file.schema.js";

const requiredIfNotDraft = function() {
  return this.eventStatus !== "draft";
};


const ticketTierSchema = new mongoose.Schema({
  name : {
    type : String,
    required : true,
    trim : true
  },
  price : {
    type  : Number,
    required : true,
    min : 0
  },
  capacity : {
    type : Number,
    required : true,
    min : 1
  },
  sold : {
    type : Number,
    default : 0
  },
  benefits : {
    type : [String],
    default : []
  }
},{_id : true})

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
  ticketTiers : {
    type :[ticketTierSchema],
    default : [],

    validate :{
      validator : function (tiers) {
        if(this.ticketType === "Free"){
          return true
        }

        return tiers.length > 0 
      },
      message : "At least one ticket tier is required for paid events"
    }
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
    enum : ["draft","pending","cancelled","completed","pending"],
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