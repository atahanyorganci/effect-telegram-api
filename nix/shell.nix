{
  perSystem = {pkgs, ...}: {
    devShells.default = pkgs.mkShellNoCC {
      buildInputs = with pkgs; [
        nodejs-slim
        corepack
      ];
      shellHook = ''
        corepack install
      '';
    };
  };
}
