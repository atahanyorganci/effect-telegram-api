{
  perSystem = { ...}: {
    treefmt = {
      projectRootFile = "flake.nix";
      programs = {
        deadnix.enable = true;
        alejandra.enable = true;
        yamlfmt = {
          enable = true;
          excludes = ["pnpm-lock.yaml"];
        };
        mdsh.enable = true;
      };
    };
  };
}
