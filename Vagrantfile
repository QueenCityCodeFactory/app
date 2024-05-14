require 'yaml'

def fail_with_message(msg)
  fail Vagrant::Errors::VagrantError.new, msg
end

config_path = __dir__
config_file = File.join(config_path, 'vagrant.yml')

if File.exists?(config_file)
  settings = YAML.load_file(config_file)
else
  fail_with_message "#{config_file} was not found. Please set `config_path` in your Vagrantfile."
end

Vagrant.configure("2") do |config|
  config.hostmanager.enabled = false
  config.hostmanager.manage_host = true
  config.hostmanager.manage_guest = false
  config.hostmanager.ignore_private_ip = false
  config.hostmanager.include_offline = true

  config.vm.define settings['name'] do |node|
    node.vm.box = settings['box']

    node.vm.provider "parallels" do |prl|
      prl.name = settings['vm_name']
      prl.memory = settings['memory']
      prl.cpus = settings['cpus']
      prl.linked_clone = false
    end

    node.vm.provider "virtualbox" do |v, override|
      v.customize ['modifyvm', :id, '--ioapic', 'on']
      v.customize ["modifyvm", :id, "--rtcuseutc", "on"]
      v.customize ["modifyvm", :id, "--memory", settings['memory']]
      v.customize ["modifyvm", :id, "--cpus", settings['cpus']]
    end

    node.vm.provider "vmware_fusion" do |v, override|
      v.vmx["memsize"] = settings['memory']
      v.vmx["numvcpus"] = settings['cpus']
      v.whitelist_verified = true
      v.ssh_info_public = true
      v.port_forward_network_pause = 10
    end

    # preference
    node.vm.provider "parallels"
    node.vm.provider "virtualbox"
    node.vm.provider "vmware_fusion"

    node.vm.network "private_network", type: "dhcp"
    node.vm.hostname = settings['hostname']
    node.ssh.forward_agent = true

    config.hostmanager.ip_resolver = proc do |vm, resolving_vm|
      if hostname = (vm.ssh_info && vm.ssh_info[:host])
        `vagrant ssh -- "hostname -I"`.strip.split(' ').last
      end
    end

    #Add any alias:
    node.hostmanager.aliases = settings['aliases']

    node.vm.synced_folder ".", settings['app_path'], type: "nfs", nfs_udp: false, mount_options: ['nolock,noatime,actimeo=1']

    #Fix for Ansible bug resulting in an encoding error
    ENV['PYTHONIOENCODING'] = "utf-8"

    node.vm.provision :hostmanager
    node.vm.provision "ansible" do |ansible|
      ansible.limit = 'all'
      ansible.verbose = 'v'
      ansible.playbook = settings['ansible']['playbook']
      ansible.inventory_path = settings['ansible']['host']
      ansible.raw_arguments = Shellwords.shellsplit(ENV["ANSIBLE_ARGS"]) if ENV["ANSIBLE_ARGS"]
      ansible.compatibility_mode = '2.0'
    end

    node.trigger.after :destroy do |trigger|
      trigger.info  = "Running hostmanager to clean up hosts file"
      trigger.run =  {inline: "vagrant hostmanager"}
    end;

    node.ssh.shell = "bash -c 'BASH_ENV=/etc/profile exec bash'"

    if settings['message'] != nil
        config.vm.post_up_message = settings['message']
    end
  end
end
