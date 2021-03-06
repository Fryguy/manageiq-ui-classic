module TreeNode
  class Snapshot < Node
    set_attribute(:image, '100/snapshot.png')
    set_attribute(:tooltip, &:name)
    set_attribute(:title) do
      if @object.current?
        "#{@object.name} (#{_('Active')})"
      else
        @object.name
      end
    end
  end
end
