// Import Type from graphql
const { GraphQLList, GraphQLID, GraphQLString } = require('graphql');
// Import our own created types
const { UserType, QuizType } = require('./types');
// Import the User and Quiz model so we can query MongoDB
const { User, Quiz } = require('../models');


const users = {
    type: new GraphQLList(UserType),
    description: 'Get all users from the database',
    async resolve(parent, args){
        return await User.find()
    }
}


const user = {
    type: UserType,
    description: 'Query single user by ID',
    args: {
        id: { type: GraphQLID }
    },
    resolve(parent, args){
        console.log(parent, args)
        return User.findById(args.id)
    }
}


const quizBySlug = {
    type: QuizType,
    description: 'Query a quiz by its unique slug',
    args: {
        slug: { type: GraphQLString }
    },
    resolve(parent, args){
        return Quiz.findOne({ slug: args.slug })
    }
}


module.exports = {
    users,
    user,
    quizBySlug
}