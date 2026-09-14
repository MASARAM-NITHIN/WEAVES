{ pkgs }: {
  deps = [
    pkgs.jdk21_headless
    pkgs.maven
    pkgs.nodejs_20
  ];
}
