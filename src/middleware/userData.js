const axios = require('axios');

const userData = async (req, res, next) => {
    if (!req.verifiedUser){
        next();
    } else {
        // Get the quiz info for the verified user
        try{
            const query = `
                query($id: ID!){
                    user(id: $id){
                        id
                        quizzes{
                            id
                            title
                            slug
                            description
                            questions{
                                id
                                title
                                correctAnswer
                                order
                            }
                        }
                    }
                }
            `;

            const { data } = await axios.post(
                process.env.GRAPHQL_ENDPOINT,
                {
                    query,
                    variables: { id: req.verifiedUser._id }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            req.verifiedUser.quizzes = data.data.user.quizzes;
            next();
        } catch(err) {
            console.log(err);
            req.verifiedUser.quizzes = [];
            next();
        };
    };
};

module.exports = { userData };