const Sauce = require('../models/Sauce')

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes:0,
        dislikes:0,
        usersLiked:[],
        usersDisliked:[]
    });
  
    sauce.save()
    .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
    .catch(error => { res.status(400).json( { error })})
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message : 'Pas autorisé.'});
            } else {
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Sauce modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
        .catch(error => res.status(400).json({error}));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({error}));
};

exports.getallSauces = (req, res, next) => {
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({error}))
};

exports.likeSauce = (req, res, next) => {
    like = req.body.like;
    userId = req.body.userId;
    
    Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {

        // like = 1 => like
        if(!sauce.usersLiked.includes(userId) && like === 1){
            // si le user à deja dislike, on retire le dislike
            if(sauce.usersDisliked.includes(userId)){
                Sauce.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { dislikes: -1 },
                        $pull: { usersDisliked: userId}
                    }
                )
                .then(() => res.status(201).json({message: "sauce dislike -1."}))
                .catch(error => res.status(400).json({error}))
            }
            // on ajoute un like
            Sauce.updateOne(
                { _id: req.params.id },
                {
                    $inc: { likes: 1 },
                    $push: { usersLiked: userId},
                }
            )
            .then(() => res.status(201).json({message: "sauce like +1."}))
            .catch(error => res.status(400).json({error}))
        };

        // like = -1 => dislike
        if(!sauce.usersDisliked.includes(userId) && like === -1){
            // si le user a deja like, un suprime le like 
            if(sauce.usersLiked.includes(userId)){
                Sauce.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { likes: -1 },
                        $pull: { usersLiked: userId}
                    }
                )
                .then(() => res.status(201).json({message: "sauce like -1."}))
                .catch(error => res.status(400).json({error}))
            }
            // on ajoute un dislike
            Sauce.updateOne(
                { _id: req.params.id },
                {
                    $inc: { dislikes: 1 },
                    $push: { usersDisliked: userId}
                }
            )
            .then(() => res.status(201).json({message: "sauce dislike +1."}))
            .catch( error => res.status(400).json({error}))
        };

        // like = 0 remise à null
        if(like === 0){
            if(sauce.usersDisliked.includes(userId)){
                Sauce.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { dislikes: -1 },
                        $pull: { usersDisliked: userId}
                    }
                )
                .then(() => res.status(201).json({message: "sauce dislike 0."}))
                .catch( error => res.status(400).json({error}))
            }

            if(sauce.usersLiked.includes(userId)){
                Sauce.updateOne(
                    { _id: req.params.id },
                    {
                        $inc: { likes: -1 },
                        $pull: { usersLiked: userId}
                    }
                )
                .then(() => res.status(201).json({message: "sauce like 0."}))
                .catch( error => res.status(400).json({error}))
            }
        };
    })
    .catch(error => res.status(404).json({error}));
};