import mongoose,{Schema} from 'mongoose';
const AdminUserSchema=new Schema({name:{type:String,required:true},email:{type:String,required:true,unique:true,lowercase:true},passwordHash:{type:String,required:true},role:{type:String,enum:['admin','editor'],default:'admin'},active:{type:Boolean,default:true}},{timestamps:true});
export const AdminUser=mongoose.models.AdminUser||mongoose.model('AdminUser',AdminUserSchema);
