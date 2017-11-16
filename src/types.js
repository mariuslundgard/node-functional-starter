// @flow

export type Config = {
  manifest: {
    [key: string]: string
  }
}

export type Link = {
  label: string,
  path: string
}

export type Post = {
  id: string,
  title: string,
  content: string
}

export type PostPreview = {
  id: string,
  title: string
}
