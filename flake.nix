{
  description = "DevOps Project Environment with Terraform, Ansible and AWS CLI";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        # SỬA Ở ĐÂY: Thêm config allowUnfree = true
        pkgs = import nixpkgs {
          inherit system;
          config = {
            allowUnfree = true;
          };
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            terraform      
            ansible        
            awscli2        
            sshpass        
	    openssh
	    lazygit
          ];

          shellHook = ''
            echo "================================================"
            echo "🚀 Welcome to DevOps Final Project Environment!"
            echo "🛠️  Tools ready: Terraform, Ansible, AWS CLI"
            echo "================================================"
            
            alias tf="terraform"
            alias ans="ansible-playbook"
            
            echo "Terraform version: $(terraform --version | head -n 1)"
            echo "Ansible version: $(ansible --version | head -n 1)"
          '';
        };
      }
    );
}
