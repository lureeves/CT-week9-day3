const { GraphQLString, GraphQLID } = require('graphql');
const { User, Quiz } = require('../models');
const bcrypt = require('bcrypt');
const { createJWT } = require('../util/auth');


const register = {
    type: GraphQLString,
    description: 'Register a new user',
    args: {
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString }
    },
    async resolve(parent, args){
        const checkUser = await User.findOne({ email: args.email }).exec();
        if (checkUser){
            throw new Error("User with this email address already exists");
        }

        const { username, email, password } = args;
        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({ username, email, password: passwordHash });

        await user.save();

        const token = createJWT(user);

        return token
    }
}


const login = {
    type: GraphQLString,
    description: 'Authenticate a user',
    args: {
        email: { type: GraphQLString },
        password: { type: GraphQLString }
    },
    async resolve(parent, args){
        // Get the user form the database based on email
        const user = await User.findOne({ email: args.email });
        // Get the hashed password from the user OR set it to an empty string if no user
        const hashedPassword = user?.password || '';
        // Check the password
        const correctPassword = await bcrypt.compare(args.password, hashedPassword);
        // If no user with email or the password is incorrect
        if (!user || !correctPassword){
            throw new Error('Invalid Credentials');
        };
        // credentail our user (create a token)
        const token = createJWT(user);

        return token;
    }
};


const createQuiz = {
    type: GraphQLString,
    description: "Creates a new quiz",
    args: {
        title: { type: GraphQLString },
        description: { type: GraphQLString },
        userId: { type: GraphQLID }
    },
    async resolve(parent, args){
        // Generate a slug for our quiz based on the title
        let slugify = args.title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
        // Add a random integer to the end of the slug, check that the slug does not already exist,
        // if it does exist, generate a new slug number
        let fullSlug;
        let existingQuiz;
        do {
            let slugId = Math.floor(Math.random() * 1000);
            fullSlug = `${slugify}-${slugId}`;

            existingQuiz = await Quiz.findOne({ slug: fullSlug })
        } while (existingQuiz);

        // Create a new instance of Quiz
        const quiz = new Quiz({
            title: args.title,
            slug: fullSlug,
            description: args.description,
            userId: args.userId
        });

        await quiz.save();

        return quiz.slug
    }
}


module.exports = {
    register,
    login,
    createQuiz
}