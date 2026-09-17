{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.jdk17_headless
    pkgs.maven
  ];
}
