// import { NextFunction, Request, Response } from 'express';
// import { pool } from '../config/database';
// // import { User } from '../types/types';
// import { ResultSetHeader } from 'mysql2';

// // import { RowDataPacket } from 'mysql2/promise';
// import { User, Link, UserWithLinks,  } from '../types/types';
// import { mediaModel } from '../model/profiles';

// export const createUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { username, name, description } = req.body;
//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };

//     const [existing] = await pool.execute(
//       'SELECT id FROM users WHERE username = ?',
//       [username]
//     );

//     if (Array.isArray(existing) && existing.length > 0) {
//       res.status(400).json({ message: 'Username already taken' });
//       return; // Exit early
//     }

//     const profilePicture = files.profilePicture ? files.profilePicture[0].filename : null;
//     const backgroundMedia = files.backgroundMedia ? files.backgroundMedia[0].filename : null;
//     const backgroundType = files.backgroundMedia
//       ? (files.backgroundMedia[0].mimetype.startsWith('video') ? 'video' : 'image')
//       : null;

//       const media =  await mediaModel.create({
//         username: username,

//       })

//       // console.log({ username: username,
//       //   profileImage: profilePicture,
//       //   backgroundMedia: backgroundMedia,
//       //   backgroundType: backgroundType})
//       // await media.save()
//       console.log('saved ' ,media)

//     await pool.execute(
//       `INSERT INTO users (username, name, description,)
//        VALUES (?, ?, ?)`,
//       [username, name, description]
//     );

//     // console.log('User created')

//     res.status(201).json({ message: 'User created successfully' });
//   } catch (error) {
//     next(error); // Pass the error to the error handler
//   }
// };


// export const getUserByUsername = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { username } = req.params;





//     const [rows] = await pool.execute<UserWithLinks[]>(
//       `SELECT
//          u.id AS userId, u.username, u.name, u.description,
//          u.profilePicture, u.backgroundMedia, u.backgroundType,
//          u.email, u.createdAt, u.updatedAt,
//          l.id AS linkId, l.title AS linkTitle, l.url AS linkUrl
//        FROM users u
//        LEFT JOIN links l ON l.userId = u.id
//        WHERE u.username = ?`,
//       [username]
//     );

//     const[totalVisit] = await pool.execute<UserWithLinks[]> (
//       `UPDATE users SET totalVisit = totalVisit + 1 WHERE username = ?` , [username]
//     )
//     if (!rows.length) {
//       res.status(404).json({ message: 'User not found' });
//       return;
//     }

//     const media = await mediaModel.findOne({username: username})
//     // console.log(media)
//     // Extract user data from the first row
//     const user = {
//       id: rows[0].userId,
//       username: rows[0].username,
//       name: rows[0].name,
//       description: rows[0].description,
//       profilePicture: media?.profileImage
//         ? `data:image/jpeg;base64,${Buffer.from(media.profileImage).toString('base64')}`
//         : null,
//       backgroundMedia: media?.backgroundMedia
//         ? `data:image/${rows[0].backgroundType || 'jpeg'};base64,${Buffer.from(media.backgroundMedia).toString('base64')}`
//         : null,
//       backgroundType: media?.backgroundType,
//       email: rows[0].email,
//       createdAt: rows[0].createdAt,
//       updatedAt: rows[0].updatedAt,
//       totalVisit: totalVisit
//     };


//     const links: Link[] = rows
//       .filter((row) => row.linkId)
//       .map((row) => ({
//         id: row.linkId as number,
//         userId: rows[0].userId,
//         title: row.linkTitle as string,
//         url: row.linkUrl as string,
//         order: 0,
//         createdAt: rows[0].createdAt,
//         updatedAt: rows[0].updatedAt,
//       }));

//     // Combine user and links into the profile response
//     const userProfile = {
//       ...user,
//       links,
//     };

//     res.json(userProfile);
//   } catch (error) {
//     next(error);
//   }
// };




// export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { username } = req.params;
//     const { name, description } = req.body;
//     const files = req.files as { [fieldname: string]: Express.Multer.File[] };

//     // Fetch user ID from MySQL
//     const [user] = await pool.execute(
//       'SELECT id FROM users WHERE username = ?',
//       [username]
//     );

//     if (!Array.isArray(user) || user.length === 0) {
//       res.status(404).json({ message: 'User not found' });
//       return; // Exit early
//     }

//     const profilePicture = files.profilePicture ? files.profilePicture[0].buffer : undefined;
//     const backgroundMedia = files.backgroundMedia ? files.backgroundMedia[0].buffer : undefined;
//     const backgroundType = files.backgroundMedia
//       ? (files.backgroundMedia[0].mimetype.startsWith('video') ? 'video' : 'image')
//       : undefined;

//     let updateQuery = 'UPDATE users SET name = ?, description = ?';
//     const params: (string | Buffer)[] = [name, description];

//     if (profilePicture) {
//       const mediaUpdate = await mediaModel.updateOne(
//         { username: username },
//         { $set: { profileImage: profilePicture } }
//       );
//       console.log('Profile picture update result:', mediaUpdate);
//     }

//     if (backgroundMedia) {
//       const mediaUpdate = await mediaModel.updateOne(
//         { username: username },
//         { $set: { backgroundMedia: backgroundMedia, backgroundType: backgroundType } }
//       );
//       console.log('Background media update result:', mediaUpdate);
//     }

//     // Continue with MySQL update query
//     updateQuery += ' WHERE username = ?';
//     params.push(username);

//     console.log('MySQL update query:', updateQuery);
//     await pool.execute(updateQuery, params);

//     res.json({ message: 'User updated successfully' });
//   } catch (error) {
//     console.error('Error updating user:', error);
//     next(error);
//   }
// };


// 
export const updatePreferences = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const username = req.params.username;
    const actorId = (req.user as any).id;
    const user = await User.findOne({ username });
    if (!user || user.id !== actorId) {
      res.status(403).json({ message: 'You can only update your own profile settings.' });
      return;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'aliases') && !user.premium) {
      res.status(403).json({ message: 'Aliases are a premium feature.' });
      return;
    }

    const allowed = [
      'name','location','showLocation','showDiscordPresence','discordUsername',
      'profileOpacity','profileBlur','backgroundOpacity','cardOpacity','cardBlur','profileGradient','monochromeIcons','animatedTitle',
      'usernameEffect','backgroundEffect','cursorEffect','fontFamily',
      'typewriterEnabled','typewriterTexts','pageEnterText','pageClickSound',
      'audioUrl','audioTitle','audioAutoplay','audioCoverUrl','layout','metadataTitle','metadataDescription','metadataImage','aliases','customFontFamily','customEmojis',
      'secondTab','accentColor','textColor','backgroundColor','customFontFamily'
    ] as const;

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        (user as any)[key] = req.body[key];
      }
    }

    await user.save();
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Legacy deleteUser declaration removed; active implementation is below.

//   try {
//     const { username } = req.params;

//     const [result] = await pool.execute(
//       'DELETE FROM users WHERE username = ?',
//       [username]
//     );

//     if ((result as any).affectedRows === 0) {
//       res.status(404).json({ message: 'User not found' });
//       return;
//     }

//     res.json({ message: 'User deleted successfully' });
//   } catch (error) {
//     next(error);
//   }
// };

// export const setUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   const { username } = req.body;
//   const userId = (req.user as User).id;

//   try {

//     if (!username || !userId) {
//       res.status(400).json({ message: "Username and User ID are required" });
//       return;
//     }


//     const usernameRegex = /^[a-z0-9_]{3,20}$/;
//     if (!usernameRegex.test(username)) {
//       res.status(400).json({
//         message: "Username must be 3-20 characters long and can only contain lowercase letters, numbers, and underscores"
//       });
//       return;
//     }
//     else if(username == "dashboard"){
//       res.status(400).json({
//         message: "Trying to be cheeky? YOU CANNOT USE IT."
//       })
//     }

//     // Check if username exists
//     const [existingUsers] = await pool.execute(
//       'SELECT id FROM users WHERE username = ? AND id != ?',
//       [username, userId]
//     );

//     if (Array.isArray(existingUsers) && existingUsers.length > 0) {
//       res.status(200).json({ exists: true });
//       return;
//     }


//     // const connection = await pool.getConnection();
//     // await connection.beginTransaction();

//     try {
//       // Update username
//       const [updateResult] = await pool.execute(
//         'UPDATE users SET username = ? WHERE id = ?',
//         [username, userId]
//       );


//       // const [mediaResult] = await connection.execute(
//       //   'INSERT INTO media (username) VALUES (?)',
//       //   [username]
//       // );

//      await mediaModel.create({username: username})
//       // await connection.commit();

//       const result = updateResult as ResultSetHeader;

//       if (result.affectedRows > 0) {
//         res.status(200).json({
//           exists: false,
//           userId,
//           username,
//           message: "Username set successfully"
//         });
//       } else {
//         // await connection.rollback();
//         res.status(500).json({ message: "Failed to update username" });
//       }
//     } catch (error) {
//       // await connection.rollback();
//       throw error;
//     }
//   } catch (error) {
//     console.error('Error in setUsername:', error);
//     next(error);
//   }
// };


import { NextFunction, Request, Response } from 'express';
import { User } from '../model/profiles'; // Assuming you have a User model
import { Link } from '../model/link'; // Assuming you have a Link model
import mongoose from 'mongoose';

export const createUser = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
  try {
    const { username, name, description } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    const actorId = (req.user as any)?.id;
    if (typeof actorId !== 'number') {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }
    const actor = await User.findOne({ id: actorId }).select('username');
    if (!actor || actor.username.toLowerCase() !== String(username || '').toLowerCase()) {
      res.status(403).json({ message: 'You can only create your own profile.' });
      return;
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
       res.status(400).json({ message: 'Username already taken' });
       return
    }

    // Handle file uploads
    const profilePicture = files.profilePicture ? files.profilePicture[0].buffer : undefined;
    const backgroundMedia = files.backgroundMedia ? files.backgroundMedia[0].buffer : undefined;
    const backgroundType = files.backgroundMedia
      ? (files.backgroundMedia[0].mimetype.startsWith('video') ? 'video' : 'image')
      : undefined;

    // Create new user
    const newUser = new User({
      username,
      name,
      description,
      profilePicture,
      backgroundMedia,
      backgroundType
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    next(error);
  }
};

export const getUserByUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username } = req.params;

    // Find user and increment total visit
    const user = await User.findOneAndUpdate(
      { $or: [{ username }, { aliases: username }] },
      { $inc: { totalVisit: 1 } },
      { new: true }
    );

    if (!user) {
       res.status(404).json({ message: 'User not found' });
       return
    }

    // Find links for the user
    const links = await Link.find({ userId: user._id }).sort({ order: 1 });

    // Prepare user profile response
    const userProfile = {
      ...user.toObject(),
      username: user.username,
      aliasMatched: username.toLowerCase() !== user.username.toLowerCase(),
      profilePicture: user.profilePicture
        ? `data:image/jpeg;base64,${user.profilePicture.toString('base64')}`
        : null,
      backgroundMedia: user.backgroundMedia
        ? `data:${user.backgroundType === 'video' ? 'video/mp4' : 'image/jpeg'};base64,${user.backgroundMedia.toString('base64')}`
        : null,
      customFontUrl: user.customFontMedia
        ? `data:${user.customFontMime || 'font/ttf'};base64,${user.customFontMedia.toString('base64')}`
        : '',
      audioUrl: user.audioMedia
        ? `data:${user.audioMime || 'audio/mpeg'};base64,${user.audioMedia.toString('base64')}`
        : user.audioUrl || '',
      links
    };

    res.json(userProfile);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username } = req.params;
    const { name, description } = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const appearance = {
      accentColor: req.body.accentColor,
      textColor: req.body.textColor,
      backgroundColor: req.body.backgroundColor,
    };

    for (const color of Object.values(appearance)) {
      if (color !== undefined && (typeof color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(color))) {
        res.status(400).json({ message: 'Profile colors must be six-digit hex values.' });
        return;
      }
    }

    // Find user
    const user = await User.findOne({ username });
    const actorId = (req.user as any)?.id;
    if (!user) {
       res.status(404).json({ message: 'User not found' });
       return
    }

    if (user.id !== actorId) {
      res.status(403).json({ message: 'You can only modify your own profile.' });
      return;
    }

    // Update basic user info
    if (typeof name === 'string') user.name = name;
    if (typeof description === 'string') user.description = description;
    if (appearance.accentColor) user.accentColor = appearance.accentColor;
    if (appearance.textColor) user.textColor = appearance.textColor;
    if (appearance.backgroundColor) user.backgroundColor = appearance.backgroundColor;

    // Handle profile picture
    if (files.profilePicture) {
      user.profilePicture = files.profilePicture[0].buffer;
    }

    // Handle background media. MP4/video audio is preserved.
    if (files.backgroundMedia) {
      const file = files.backgroundMedia[0];
      if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
        res.status(400).json({ message: 'Background must be an image or video file.' });
        return;
      }
      user.backgroundMedia = file.buffer;
      user.backgroundType = file.mimetype.startsWith('video/') ? 'video' : 'image';
    }

    const fontFile = files.fontFile?.[0];
    if (fontFile) {
      const allowedFontMimes = ['font/ttf','font/otf','application/x-font-ttf','application/x-font-opentype','application/octet-stream'];
      const ext = fontFile.originalname.toLowerCase().split('.').pop();
      if (!['ttf','otf'].includes(ext || '') && !allowedFontMimes.includes(fontFile.mimetype)) {
        res.status(400).json({ message: 'Custom font must be a .ttf or .otf file.' });
        return;
      }
      if (fontFile.size > 5 * 1024 * 1024) {
        res.status(400).json({ message: 'Custom font must be 5MB or smaller.' });
        return;
      }
      user.customFontMedia = fontFile.buffer;
      user.customFontMime = ext === 'otf' ? 'font/otf' : 'font/ttf';
      user.customFontName = fontFile.originalname.replace(/\.[^/.]+$/, '').slice(0,80);
      user.customFontFamily = `user-${user.id}-font`;
    }

    const audioFile = files.audioFile?.[0];
    if (audioFile) {
      if (!['audio/mpeg','audio/mp3','audio/wav','audio/ogg','audio/mp4','audio/aac'].includes(audioFile.mimetype)) {
        res.status(400).json({ message: 'Music must be an MP3 or supported audio file.' });
        return;
      }
      user.audioMedia = audioFile.buffer;
      user.audioMime = audioFile.mimetype === 'audio/mp3' ? 'audio/mpeg' : audioFile.mimetype;
      user.audioUrl = '';
      user.audioTitle = audioFile.originalname.replace(/\.[^/.]+$/, '').slice(0, 80);
    }

    await user.save();

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) : Promise<void> => {
  try {
    const { username } = req.params;
    const actorId = (req.user as any)?.id;
    const target = await User.findOne({ username });
    if (!target) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    if (target.id !== actorId) {
      res.status(403).json({ message: 'You can only delete your own account.' });
      return;
    }

    // Delete user and associated links
    const deletedUser = await User.findOneAndDelete({ username });

    if (!deletedUser) {
       res.status(404).json({ message: 'User not found' });
       return
    }

    // Optional: Delete all links associated with the user
    await Link.deleteMany({ userId: deletedUser._id });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Adjust the import path as per your project structure

export const setUsername = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const username = typeof req.body?.username === "string"
      ? req.body.username.trim().toLowerCase()
      : "";
    const userId = (req.user as any).id; // Assuming `id` is populated in the `req.user` middleware

    // Validation
    if (typeof userId === "undefined") {
      res.status(400).json({ message: "Username and User ID are required" });
      return;
    }

    // Username regex validation
    const usernameRegex = /^[a-z0-9._]{1,20}$/;
    if (!usernameRegex.test(username)) {
      res.status(400).json({
        message: "Username must be 1-20 characters using lowercase letters, numbers, periods, or underscores.",
      });
      return;
    }

    // Keep profile names from shadowing application routes.
    if (["api", "auth", "dashboard", "login", "register"].includes(username)) {
      res.status(400).json({
        message: "That username is reserved.",
      });
      return;
    }

    // Check if username exists for another user
    const existingUser = await User.findOne({
      username,
      id: { $ne: userId }, // Ensure the same `username` is not already used by another user
    });

    if (existingUser) {
      res.status(200).json({ exists: true });
      return;
    }

    // Update username
    const updatedUser = await User.findOneAndUpdate(
      { id: userId }, // Match using `id` (auto-incremented number)
      { username },
      { new: true }
    );

    if (!updatedUser) {
      res.status(500).json({ message: "Failed to update username" });
      return;
    }

    res.status(200).json({
      exists: false,
      userId: updatedUser.id,
      username: updatedUser.username,
      message: "Username set successfully",
    });
  } catch (error) {
    console.error("Error in setUsername:", error);
    next(error);
  }
};
