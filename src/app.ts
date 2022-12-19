import express, { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtExpiration, secret } from './config';

const app = express();
app.use(express.json());
app.use(express.urlencoded());

interface LoginBody {
    email: string;
    password: string;
}

const ValidateUser = (email: string, password: string) => {
    /**
     * This is not a DB or security POC, the password need to be hashed and stored on the DB
     * We gonna keep like this for now to keep it simple
     */
    if (email !== 'john.doe@mail.com' || password !== '12345') {
        return false
    }
    return true;
}

// Routes
// login route
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({ data: 'main opage' });
});

app.post('/login', (req: Request, res: Response) => {
    const { body }: { body: LoginBody } = req;

    if (!body) {
        res.status(400).send();
    }
    const { email = '', password = '' } = body;


    const isUserValid = ValidateUser(email, password)

    if (!isUserValid) {
        res.status(401).json({ err: 'email or password not valid' })
    }


    const token = jwt.sign(
        { username: 'John Doe', avatar: 'https://sample.com/image_1.jpg', id: 1 },
        secret,
        { expiresIn: 60 * parseInt(jwtExpiration), algorithm: 'HS512' }
    );

    res.setHeader('Authorization', `Bearer ${token}`);
    res.status(200).send();
});

// logout route
app.post('/logout', (_req: Request, res: Response) => {
    console.log('🚀 - logout'); // roberto
    res.removeHeader('Authorization');
    res.status(200).json();
});


// token validation middleware
const valdidateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1]
        console.log("🚀  roberto --  ~ file: app.ts:69 ~ valdidateToken ~ token", token)
        if (!token) {
            res.status(401).json({ err: 'not authorized' })
            return;
        }
        jwt.verify(token, secret);
        next();
    } catch (err) {
        res.status(401).json({ err: 'not authorized' })
        return;
    }
}

// a secret page that can only be accessed when logged in.
app.get('/secret_page', valdidateToken, (_req: Request, res: Response) => {
    res.status(200).json({ secret: 'my protected info' });
});

export default app;