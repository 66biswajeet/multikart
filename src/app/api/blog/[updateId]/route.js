import blog from "../blog.json";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  const singleBlog = (await params).updateId;

  const blogObj = blog?.data.find((elem) => elem.id == singleBlog);

  return NextResponse.json(blogObj);
}
