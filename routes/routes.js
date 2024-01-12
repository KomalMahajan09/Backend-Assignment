const express=require('express');
const router=express.Router();
const books=require('../models/books');
const multer=require('multer');
const fs=require('fs');
//image upload
var storage=multer.diskStorage({
    destination:function( req,file,cb)
    {
        cb(null,'./uploads');
    },
    filename:function(req,file,cb)
    {
        cb(null,file.fileldname+"_"+Date.now()+"_+file.originalname");

    },
});
var upload=multer(
    {
        storage:storage,

    }).single('image');

    router.post("/add",upload,(req,res)=>{
      const book = new books
      ({
            name:req.body.name,
            image:req.file.filename,
            summary:req.body.summary,

        });
        book.save((err)=>{
            if(err)
            {
                res.json({message:err.message,type:'danger'});

            }
            else{
            req.session.message={
        type:'success',
        message:'Book Added Sccess'
        };
        res.redirect('/');
        }
        });

    });

router.get("/",(req,res)=>{
 books.find().exec((err,book)=>{
    if(err){
        res.json({message:err.message});

    }
    else{
        res.render('index',{
            title:'Home Page',
            book:book,
        });
    }
 });
});
router.get('/add',(req,res)=>{
    res.render("add_books",{title:"Add Books"});
});

//edit  a book
router.get('/edit/:id',(req,res)=>{

    let id=req.params.id;
    books.findById(id,(err,book)=>
    {
        if(err){
            res.redirect('/');
        }
        else{
            if(book==null)
            {
                res.redirect('/');
            }else{
                res.render("edit_books",{
                    title:"Edit User",
                    book:book,
                });
            }

        }
    });
});
//update
router.post('/update/:id',upload,(req,res)=>{
    let id=req.params.id;
    let new_image="";
    if(req.file)
    {
        new_image=req.file.filename;
        try{
            fs.unlinkSync("./uploads/"+req.body.old_image);
        }catch(err)
        {
            console.log(err);
        }

    }else
    {
        new_image=req.body.old_image;
    }
    books.findByIdAndUpdate(id,
    {
        name:req.body.name,
        image:new_image,
        summary:req.body.summary,
    },(err,result)=>{

        if(err)
        {
            res.json({
                message:err.message,type:'danger'
            })
        }else{
            req.session.message={
                type:"success",
                message:"Book Update success",
            };
            res.redirect("/")
        }
    });
    });

    //delete
    router.get('/delete/:id',(req,res)=>{
        let id=req.params.id;
        books.findByIdAndRemove(id,(err,result)=>
        {
            if(result.image !='')
            {
                try{
                fs.unlinkSync('./uploads/'+result.image);
                }catch(err){
                    console.log(err);

                }

            }
            if(err)
            {
                res.json({message:err.message});
            }
            else{
                req.session.message=
                {
                    type:'info',
                    message:'Books deleted',
                };
                res.redirect("/");
            }
        });
    });


module.exports = router;