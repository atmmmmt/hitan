import mongoose,{Schema} from 'mongoose';
const CaseSchema=new Schema({
  fullName:{type:String,required:true,trim:true,index:true},slug:{type:String,required:true,unique:true,index:true},birthYear:Number,
  region:{type:String,trim:true,index:true},detentionPlace:{type:String,trim:true,index:true},detentionDate:Date,
  status:{type:String,enum:['detained','missing','released','unknown'],default:'unknown',index:true},
  summary:{type:String,required:true,trim:true,maxlength:1500},details:{type:String,trim:true,maxlength:10000},photoUrl:String,
  moderationStatus:{type:String,enum:['pending','approved','rejected'],default:'pending',index:true},moderationNote:String,
  submitterName:{type:String,trim:true,maxlength:200},submitterContact:{type:String,trim:true,maxlength:300},
  reviewedAt:Date,publishedAt:Date,reviewedBy:{type:Schema.Types.ObjectId,ref:'AdminUser'}
},{timestamps:true});
CaseSchema.index({fullName:'text',summary:'text',details:'text',region:'text',detentionPlace:'text'});
export const CaseModel=mongoose.models.Case||mongoose.model('Case',CaseSchema);
