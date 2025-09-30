# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a new/minimal project directory that currently contains only MCP (Model Context Protocol) server configuration.

## MCP Configuration

The project has MCP servers configured in `.mcp.json`:
- **playwright**: Playwright MCP server for browser automation tasks using `@executeautomation/playwright-mcp-server`

## Development Environment

Since this is a minimal project setup, development commands will depend on the type of project being created. Common patterns to check for:

- Look for `package.json` to determine if this is a Node.js project
- Check for `requirements.txt` or `pyproject.toml` for Python projects
- Look for `Cargo.toml` for Rust projects
- Check for build configuration files like `webpack.config.js`, `vite.config.js`, etc.

## Browser Automation

The project is configured with Playwright MCP server, which enables:
- Web scraping and data extraction
- Browser-based testing
- Web automation tasks
- Page screenshots and PDF generation

## Project Structure

Currently minimal - the project structure will be established as development progresses. Update this section as the codebase grows.