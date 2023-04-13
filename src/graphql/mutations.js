const { GraphQLString } = require('graphql');
const { User } = require('../models');
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
        // console.log(user, correctPassword)
        // If no user with email or the password is incorrect
        if (!user || !correctPassword){
            throw new Error('Invalid Credentials');
        };
        // credentail our user (create a token)
        const token = createJWT(user);

        return token;
    }
};


module.exports = {
    register,
    login
}