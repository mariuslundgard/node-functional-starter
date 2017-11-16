// @flow

import express from 'express'

import type {$Request, $Response} from 'express'
import type {Config, Post, PostPreview} from '../types'
import posts from './data/posts'

function mapPostToPostPreview (post: Post): PostPreview {
  return {
    id: post.id,
    title: post.title
  }
}

export function create (config: Config) {
  const router = express.Router()

  router.get('/home', async (req: $Request, res: $Response) => {
    res.json({
      title: 'Home',
      _embedded: {
        postPreview: posts.map(mapPostToPostPreview)
      }
    })
  })

  router.get('/blog', async (req: $Request, res: $Response) => {
    res.json({
      title: 'Blog',
      _embedded: {
        postPreview: posts.map(mapPostToPostPreview)
      }
    })
  })

  router.get('/post/:id', async (req: $Request, res: $Response) => {
    const post = posts.find(d => d.id === req.params.id)

    if (post) {
      res.json(post)
    } else {
      res.status(404)
      res.json({message: 'Not found'})
    }
  })

  return router
}
