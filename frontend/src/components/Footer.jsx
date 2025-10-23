function Footer() {
  return (
    <footer className="w-full mt-auto py-6 border-t border-glass-border">
      <div className="container mx-auto px-4 md:px-10 text-center text-secondary-text text-sm">
        <p>&copy; {new Date().getFullYear()} somthing.</p>
        <p>Footer.</p>
      </div>
    </footer>
  );
}
export default Footer;
