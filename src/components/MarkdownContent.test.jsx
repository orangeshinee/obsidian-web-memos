import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MarkdownContent from "./MarkdownContent";

describe("MarkdownContent", () => {
  it("正确渲染普通文本", () => {
    render(<MarkdownContent content="hello world" onTagClick={() => {}} />);
    expect(screen.getByText("hello world")).toBeInTheDocument();
  });

  it("正确渲染标签并响应点击", () => {
    const handleTagClick = jest.fn();
    render(<MarkdownContent content="#tag1 内容" onTagClick={handleTagClick} />);
    const tagBtn = screen.getByText("#tag1");
    fireEvent.click(tagBtn);
    expect(handleTagClick).toHaveBeenCalledWith("tag1");
  });

  it("支持多级标签点击", () => {
    const handleTagClick = jest.fn();
    render(<MarkdownContent content="#foo/bar 内容" onTagClick={handleTagClick} />);
    const tagBtn = screen.getByText("#foo/bar");
    fireEvent.click(tagBtn);
    expect(handleTagClick).toHaveBeenCalledWith("foo");
    expect(handleTagClick).toHaveBeenCalledWith("bar");
  });

  it("正确渲染图片", () => {
    render(<MarkdownContent content="![alt](http://img.com/1.png)" onTagClick={() => {}} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "http://img.com/1.png");
  });

  it("支持带中文的标签渲染与点击", () => {
    const handleTagClick = jest.fn();
    render(<MarkdownContent content="#生活/杂谈 内容" onTagClick={handleTagClick} />);
    const tagBtn = screen.getByText("#生活/杂谈");
    fireEvent.click(tagBtn);
    expect(handleTagClick).toHaveBeenCalledWith("生活");
    expect(handleTagClick).toHaveBeenCalledWith("杂谈");
  });
}); 