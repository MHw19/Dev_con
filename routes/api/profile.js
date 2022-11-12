const express =require('express');

const router = express.Router();
const request =require('request');
const config =require('config');
const auth =  require('../../middleware/auth');
const Profile =  require('../../models/Profile');
const User=  require('../../models/User');
const { check, validationResult } = require('express-validator');

//@route GET api/profile/me
//@desc  Get current user profile
//@acess private

router.get('/me',auth, async(req,res)=> {

try {
    
 const profile =await Profile.findOne({user : req.user.id}).populate('user',['name','avatar']);

 if(!profile){

 return res.status(400).json({msg:'There is no profile for this user '})

 }

res.json(profile);


} catch (error) {
    console.error(error.message);
    return res.status(500).send('Server Error')
}
});

//@route POST api/profile
//@desc  Create or update user profile
//@acess private

router.post('/',[auth,
[
check('status','Status is required').not().isEmpty(),
check('skills','Skills is required').not().isEmpty()
]
], 
async(req,res)=> {


const errors= validationResult(req);
if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
    
}

const  {
company,
website,
location,
bio,
status,
githubusername,
skills,
youtube,
facebook,
twitter,
instagram,
linkedin
} =req.body;

const profileFields= {}
profileFields.user=  req.user.id;
if(company) profileFields.company=  company;
if(website) profileFields.website=  website;
if(location) profileFields.location=  location;
if(bio) profileFields.bio=  bio;
if(status) profileFields.status=  status;
if(githubusername) profileFields.githubusername=  githubusername;

if(skills){
profileFields.skills =skills.split(',').map(skill => skill.trim())
}
console.log(profileFields.skills);
profileFields.social= {}

if(youtube) profileFields.social.youtube =youtube;
if(facebook) profileFields.social.facebook =facebook;
if(twitter) profileFields.social.twitter =twitter;
if(instagram) profileFields.social.instagram =instagram;
if(linkedin) profileFields.social.linkedin =linkedin;


try {
    
let profile =await Profile.findOne({user : req.user.id});

if(profile){
profile =await Profile.findOneAndUpdate(
{user : req.user.id},
{$set : profileFields},
{new : true}

);
return res.json(profile);
}

profile =new Profile(profileFields);

await profile.save();

res.json(profile);
} catch (error) {

console.error(error.message);
res.status(500).send('Server Error');
    
}


    


});

//@route GET api/profile
//@desc  Get all profile
//@acess public

router.get('/',async(req,res)=>{

try {

const profiles = await Profile.find().populate('user',['name','avatar']);
res.json(profiles);

    
} catch (error) {   
console.error(error.message);
res.status(500).send('Server Error')

}

});


//@route GET api/profile/user/:id
//@desc  Get  profile by user id
//@acess public

router.get('/user/:user_id',async(req,res)=>{

    try {
    
    const profile = await Profile.findOne({user : req.params.user_id}).populate('user',['name','avatar']);
    
    if(!profile){
    res.status(400).json({msg : 'there is no profile for this user'});  
    }
    
    res.json(profile);
    
        
    } catch (error) {   
    console.error(error.message);
    if(error.kind == 'ObjectId'){
        res.status(400).json({msg : 'Profile not found'});  

    }
    res.status(500).send('Server Error')
    
    }
});



//@route DELETE api/profile
//@desc  Delete profile, posts and user
//@acess private

router.delete('/',auth, async(req,res)=>{

  try {
   
    await Profile.findOneAndRemove({user : req.user.id})

    await User.findOneAndRemove({ _id: req.user.id})
    
    res.json({msg :'User Deleted'});  


  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error')
  }



});


//@route PUT api/profile/experience
//@desc  Add profile experience
//@acess private

router.put('/experience',[auth,[

check('title','Title is required').not().isEmpty(),
check('company','company is required').not().isEmpty(),
check('from','from date  is required').not().isEmpty(),
]],async(req,res)=>{

const errors = validationResult(req);

if(!errors.isEmpty()){

res.status(400).json({errors: errors.array()});


}

const {
title,
company,
location,
from,
to,
current,
description
} =req.body;

const newExp ={
    title,
    company,
    location,
    from,
    to,
    current,
    description
}

try {

const profile = await Profile.findOne({user : req.user.id});

profile.experience.unshift(newExp);

await profile.save();

res.json(profile);


} catch (error) {
     console.error(error.message);
    res.status(500).send('Server Error')
}

});

//@route DELETE api/profile/experience/:exp_id
//@desc  Delete experience from profile
//@acess private


router.delete('/experience/:exp_id', auth, async(req,res)=>{
try {

const profile = await Profile.findOne({user : req.user.id});

const removeIndex= profile.experience.map(item => item.id).indexOf(req.params.exp_id);

profile.experience.splice(removeIndex,1);

await profile.save();

res.json(profile);

    
} catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error')
}


});


//@route PUT api/profile/education
//@desc  Add profile education
//@acess private

router.put('/education',[auth,[

    check('school','school is required').not().isEmpty(),
    check('degree','company is required').not().isEmpty(),
    check('fieldofstudy','fieldofstudy is required').not().isEmpty(),
    check('from','from date  is required').not().isEmpty(),
    ]],async(req,res)=>{
    
    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
    
    res.status(400).json({errors: errors.array()});
    
    
    }
    
    const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
    } =req.body;
    
    const newEdu ={
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    
    try {
    
    const profile = await Profile.findOne({user : req.user.id});
    
    profile.education.unshift(newEdu);
    
    await profile.save();
    
    res.json(profile);
    
    
    } catch (error) {
         console.error(error.message);
        res.status(500).send('Server Error')
    }
    
    });
    
    //@route DELETE api/profile/education/:edu_id
    //@desc  Delete education from profile
    //@acess private
    
    
    router.delete('/education/:edu_id', auth, async(req,res)=>{
    try {
    
    const profile = await Profile.findOne({user : req.user.id});
    
    const removeIndex= profile.education.map(item => item.id).indexOf(req.params.edu_id);
    
    profile.education.splice(removeIndex,1);
    
    await profile.save();
    
    res.json(profile);
    
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error')
    }
    
    
    });


  //@route GET api/profile/github/:username
  //@desc  Get user repo from github
  //@acess public

  router.get('/github/:username',(req,res)=>{

   try {

    const options ={
    uri : `https://api.github.com/users/${req.params.username}/repos?per_page=5&
      sort=created: asc&client_id =${config.get('githubClientId')}&client_secret=
      ${config.get('githubSecret')}`,
    method :'GET',
    headers :{'user-agent': 'node.js'}

    }

    console.log('12233next');
    
   request(options,(error,response,body)=>{
   
   if(error) console.error(error);

   if(response.statusCode != 200){
   res.status(404).json({msg:'No Github profile found '});
   }
   
   res.json(JSON.parse(body));


   });

   } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error')
    
   }

  });







module.exports =router;