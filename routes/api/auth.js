const express =require('express');
const router = express.Router();
const bcrypt =require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config');
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth')

const User = require('../../models/User')

//@route GET api/auth
//@desc Test route
//@acess public 

router.get('/',auth, async(req,res)=> {
try {
    
   const user = await User.findById(req.user.id).select('-password');

   res.json(user);


} catch (error) {

  console.error(error.message);
  res.status(500).send('Server Error')  
    
}

});


//@route POST api/auth
//@desc   Authenticate user & get token
//@acess public 


router.post('/',[

    check('email','Please Enter Valid Email').isEmail(),
    check('password','password is required ').exists()
    
    ],
    
    async(req,res)=> {
    
    const errors= validationResult(req);
    if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
    
    }
    
    const {email,password} = req.body;
    
    try {
    let user = await User.findOne({email});
    
    if(!user){
    
    return res.status(400).json({errors:[{msg :'Invalid credentials'}]});
    }
  
    
    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.status(400).json({errors:[{msg :'Invalid credentials'}]});
    }

    const payload= {
    user:{
    id :user.id
    
    }
    
    }
    
    jwt.sign(payload,config.get('jwtSecret'),
    {expiresIn:36000},
    (err,token) =>{
    if(err) throw err;
    res.json({token});
    
    }
    
    )
    
    
    
    } catch (error) {
    console.error(error.message);
    res.status(500).send('server Error')
    }
    
    
      
    
    
    });




module.exports =router;