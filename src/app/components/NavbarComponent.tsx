'use client';

import Link from 'next/link';
import { Navbar } from 'flowbite-react';

export default function NavbarComponent() {
  return (
    <Navbar fluid rounded>
      <Navbar.Collapse>
        <Navbar.Link as={Link} href="/">Login Page</Navbar.Link>
        <Navbar.Link as={Link} href="/Blogpage">Blogpage</Navbar.Link>
        <Navbar.Link as={Link} href="/Dashboard">Dashboard</Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
